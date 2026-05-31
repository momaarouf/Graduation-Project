package com.travelmarket.backend.dispute.service;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.dispute.dto.request.AddDisputeResponseRequest;
import com.travelmarket.backend.dispute.dto.request.OpenDisputeRequest;
import com.travelmarket.backend.dispute.dto.request.ResolveDisputeRequest;
import com.travelmarket.backend.dispute.dto.response.DisputeResponse;
import com.travelmarket.backend.dispute.entity.Dispute;
import com.travelmarket.backend.dispute.enums.DisputeStatus;
import com.travelmarket.backend.dispute.repository.DisputeRepository;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.notification.service.NotificationService;
import com.travelmarket.backend.payment.service.StripePaymentService;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.service.EmailService;
import com.travelmarket.backend.service.TimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final StripePaymentService paymentService;
    private final EmailService emailService;
    private final TimeService timeService;

    // A dispute can only be opened within 7 days of the booking being created/completed.
    private static final int DISPUTE_WINDOW_DAYS = 7;

    @Transactional
    public DisputeResponse openDispute(String userEmail, OpenDisputeRequest request) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // 1. Validate Booking Status (must be Completed or InProgress)
        if (booking.getStatus() != BookingStatus.Completed && booking.getStatus() != BookingStatus.InProgress) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Disputes can only be opened for Completed or InProgress bookings.");
        }

        // 2. Validate Time Window
        if (booking.getCompletedAtUtc() != null) {
            if (timeService.getCurrentUtc().isAfter(booking.getCompletedAtUtc().plus(DISPUTE_WINDOW_DAYS, ChronoUnit.DAYS))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Disputes must be opened within " + DISPUTE_WINDOW_DAYS + " days of completion.");
            }
        }

        // 3. User Ownership & Determine Parties
        Long travelerUserId = booking.getTraveler().getUser().getId();
        Long guideUserId = booking.getOccurrence().getTemplate().getGuide().getUser().getId();
        
        User openedBy;
        User against;

        if (caller.getId().equals(travelerUserId)) {
            openedBy = caller;
            against = booking.getOccurrence().getTemplate().getGuide().getUser();
        } else if (caller.getId().equals(guideUserId)) {
            openedBy = caller;
            against = booking.getTraveler().getUser();
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a party to this booking");
        }

        // 4. Duplicate Check
        if (disputeRepository.existsByBookingIdAndStatusIn(booking.getId(), 
            List.of(DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW, DisputeStatus.RESOLVED))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "There is already an active dispute for this booking.");
        }

        // 5. Create Dispute
        Dispute dispute = new Dispute();
        dispute.setBooking(booking);
        dispute.setOpenedByUser(openedBy);
        dispute.setAgainstUser(against);
        dispute.setReason(request.getReason());
        dispute.setDescription(request.getDescription());
        dispute.setStatus(DisputeStatus.OPEN);

        Dispute saved = disputeRepository.save(dispute);

        // 6. Notifications — notify the user it was opened against
        notificationService.createNotification(
            against.getId(),
            NotificationType.DISPUTE_OPENED,
            "Dispute Opened",
            "A dispute has been opened regarding your booking for " + booking.getOccurrence().getTemplate().getTitle(),
            String.valueOf(saved.getId()),
            "DISPUTE"
        );
        // Email the defendant
        emailService.sendDisputeOpenedEmail(
            against.getEmail(),
            against.getFullName() != null ? against.getFullName() : against.getEmail(),
            booking.getOccurrence().getTemplate().getTitle(),
            saved.getId()
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DisputeResponse> getMyDisputes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                
        return disputeRepository.findByOpenedByUserIdOrAgainstUserIdOrderByCreatedAtUtcDesc(user.getId(), user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DisputeResponse getDisputeById(String userEmail, Long disputeId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispute not found"));

        // Allow admin or involved parties
        if (user.getRole() != User.Role.Admin &&
            !dispute.getOpenedByUser().getId().equals(user.getId()) &&
            !dispute.getAgainstUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return mapToResponse(dispute);
    }

    @Transactional
    public DisputeResponse submitResponse(String userEmail, Long disputeId, AddDisputeResponseRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispute not found"));

        if (!dispute.getAgainstUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the defending party can submit a response");
        }

        if (dispute.getStatus() == DisputeStatus.RESOLVED || dispute.getStatus() == DisputeStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot respond to a finalized dispute");
        }

        dispute.setAgainstUserResponse(request.getResponse());
        Dispute saved = disputeRepository.save(dispute);

        // Notify opener that the other party responded
        notificationService.createNotification(
            dispute.getOpenedByUser().getId(),
            NotificationType.DISPUTE_STATUS_CHANGED,
            "Response Submitted",
            "The other party has submitted a response to your dispute.",
            String.valueOf(dispute.getId()),
            "DISPUTE"
        );
        // Email the opener
        String tourTitle = dispute.getBooking().getOccurrence().getTemplate().getTitle();
        User opener = dispute.getOpenedByUser();
        emailService.sendDisputeResponseSubmittedEmail(
            opener.getEmail(),
            opener.getFullName() != null ? opener.getFullName() : opener.getEmail(),
            tourTitle,
            dispute.getId()
        );

        return mapToResponse(saved);
    }

    // --- Admin Operations ---

    @Transactional(readOnly = true)
    public Page<DisputeResponse> getAllDisputes(Pageable pageable) {
        return disputeRepository.findAllByOrderByCreatedAtUtcDesc(pageable).map(this::mapToResponse);
    }

    @Transactional
    public DisputeResponse markUnderReview(Long disputeId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispute not found"));

        if (dispute.getStatus() != DisputeStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dispute is not OPEN");
        }

        dispute.setStatus(DisputeStatus.UNDER_REVIEW);
        Dispute saved = disputeRepository.save(dispute);

        notifyParties(saved, NotificationType.DISPUTE_STATUS_CHANGED, "Dispute Under Review",
            "Your dispute is now under review by an administrator.");
        // Email both parties
        String tourTitle = saved.getBooking().getOccurrence().getTemplate().getTitle();
        emailBothParties(saved, tourTitle, (email, name) ->
            emailService.sendDisputeUnderReviewEmail(email, name, tourTitle, saved.getId()));

        return mapToResponse(saved);
    }

    @Transactional
    public DisputeResponse rejectDispute(Long disputeId, String reason) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispute not found"));

        if (dispute.getStatus() == DisputeStatus.RESOLVED || dispute.getStatus() == DisputeStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dispute already finalized");
        }

        dispute.setStatus(DisputeStatus.REJECTED);
        dispute.setResolutionNote(reason);
        Dispute saved = disputeRepository.save(dispute);

        notifyParties(saved, NotificationType.DISPUTE_REJECTED, "Dispute Rejected",
            "The dispute has been rejected. Reason: " + reason);
        // Email both parties
        String tourTitle = saved.getBooking().getOccurrence().getTemplate().getTitle();
        emailBothParties(saved, tourTitle, (email, name) ->
            emailService.sendDisputeRejectedEmail(email, name, tourTitle, saved.getId(), reason));

        return mapToResponse(saved);
    }

    @Transactional
    public DisputeResponse resolveDispute(Long disputeId, ResolveDisputeRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispute not found"));

        if (dispute.getStatus() == DisputeStatus.RESOLVED || dispute.getStatus() == DisputeStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dispute already finalized");
        }

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolutionNote(request.getResolutionNote());

        if (request.getRefundAmount() != null && request.getRefundAmount().signum() > 0) {
            dispute.setRefundAmount(request.getRefundAmount());
            // Issue refund via Payment Service
            paymentService.issueRefund(dispute.getBooking().getId(), request.getRefundAmount());
        }

        Dispute saved = disputeRepository.save(dispute);

        notifyParties(saved, NotificationType.DISPUTE_RESOLVED, "Dispute Resolved",
            "Your dispute has been resolved. Please check the details.");
        // Email both parties with resolution note and optional refund
        String tourTitle = saved.getBooking().getOccurrence().getTemplate().getTitle();
        String refundInfo = (request.getRefundAmount() != null && request.getRefundAmount().signum() > 0)
            ? request.getRefundAmount().toPlainString() + " USD" : null;
        emailBothParties(saved, tourTitle, (email, name) ->
            emailService.sendDisputeResolvedEmail(email, name, tourTitle, saved.getId(),
                request.getResolutionNote(), refundInfo));

        return mapToResponse(saved);
    }

    private void notifyParties(Dispute dispute, NotificationType type, String title, String message) {
        String refId = String.valueOf(dispute.getId());
        notificationService.createNotification(dispute.getOpenedByUser().getId(), type, title, message, refId, "DISPUTE");
        notificationService.createNotification(dispute.getAgainstUser().getId(), type, title, message, refId, "DISPUTE");
    }

    @FunctionalInterface
    private interface EmailSender {
        void send(String email, String name);
    }

    private void emailBothParties(Dispute dispute, String tourTitle, EmailSender sender) {
        User opener = dispute.getOpenedByUser();
        User against = dispute.getAgainstUser();
        sender.send(opener.getEmail(), opener.getFullName() != null ? opener.getFullName() : opener.getEmail());
        sender.send(against.getEmail(), against.getFullName() != null ? against.getFullName() : against.getEmail());
    }

    private DisputeResponse mapToResponse(Dispute dispute) {
        return DisputeResponse.builder()
                .id(dispute.getId())
                .bookingId(dispute.getBooking().getId())
                .openedByUserId(dispute.getOpenedByUser().getId())
                .openedByFullName(dispute.getOpenedByUser().getFullName())
                .openedByRole(dispute.getOpenedByUser().getRole().name())
                .againstUserId(dispute.getAgainstUser().getId())
                .againstFullName(dispute.getAgainstUser().getFullName())
                .againstRole(dispute.getAgainstUser().getRole().name())
                .reason(dispute.getReason())
                .description(dispute.getDescription())
                .againstUserResponse(dispute.getAgainstUserResponse())
                .status(dispute.getStatus())
                .resolutionNote(dispute.getResolutionNote())
                .refundAmount(dispute.getRefundAmount())
                .createdAtUtc(dispute.getCreatedAtUtc())
                .updatedAtUtc(dispute.getUpdatedAtUtc())
                .build();
    }
}

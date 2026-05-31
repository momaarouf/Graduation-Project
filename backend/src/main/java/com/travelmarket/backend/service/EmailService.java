package com.travelmarket.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Async
    public void send(String to, String subject, String text) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        mailSender.send(msg);
    }
    
    @Async
    public void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    @Async
    public void sendSetupPasswordReminder(String to, String name) {
        String subject = "Set up your SafariHub password";
        String body = "Hi " + (name != null ? name : "Traveler") + ",\n\n"
                + "Welcome to SafariHub! Since you signed up with Google, you don't have a password set yet.\n\n"
                + "To ensure you always have access to your account, we recommend setting a password.\n"
                + "You can do this securely in your account Settings.\n\n"
                + "Thanks,\nSafariHub Team";
        
        send(to, subject, body);
    }

    // ─── Dispute Emails ───────────────────────────────────────────────────────

    @Async
    public void sendDisputeOpenedEmail(String to, String recipientName, String tourTitle, Long disputeId) {
        String subject = "⚠️ A Dispute Has Been Opened — Booking for " + tourTitle;
        String body = String.format("""
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px">
              <h2 style="color:#b45309">⚠️ Dispute Opened</h2>
              <p>Hi <strong>%s</strong>,</p>
              <p>A dispute has been filed regarding your booking for <strong>%s</strong>.</p>
              <p>You may log in to your dashboard to view the details and submit your response.</p>
              <p style="margin-top:24px;color:#6b7280;font-size:13px">Dispute ID: #%d</p>
              <p style="color:#6b7280;font-size:13px">SafariHub Support Team</p>
            </div>
            """, recipientName, tourTitle, disputeId);
        sendHtml(to, subject, body);
    }

    @Async
    public void sendDisputeUnderReviewEmail(String to, String recipientName, String tourTitle, Long disputeId) {
        String subject = "🔍 Your Dispute Is Now Under Review — " + tourTitle;
        String body = String.format("""
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px">
              <h2 style="color:#1d4ed8">🔍 Dispute Under Review</h2>
              <p>Hi <strong>%s</strong>,</p>
              <p>The dispute for your booking of <strong>%s</strong> is now being reviewed by our admin team.</p>
              <p>We'll notify you as soon as a decision has been made. This typically takes 1–3 business days.</p>
              <p style="margin-top:24px;color:#6b7280;font-size:13px">Dispute ID: #%d</p>
              <p style="color:#6b7280;font-size:13px">SafariHub Support Team</p>
            </div>
            """, recipientName, tourTitle, disputeId);
        sendHtml(to, subject, body);
    }

    @Async
    public void sendDisputeResponseSubmittedEmail(String to, String recipientName, String tourTitle, Long disputeId) {
        String subject = "💬 The Other Party Responded to Your Dispute — " + tourTitle;
        String body = String.format("""
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px">
              <h2 style="color:#7c3aed">💬 New Response on Your Dispute</h2>
              <p>Hi <strong>%s</strong>,</p>
              <p>The other party has submitted a response to your dispute for <strong>%s</strong>.</p>
              <p>Log in to your dashboard to view their response.</p>
              <p style="margin-top:24px;color:#6b7280;font-size:13px">Dispute ID: #%d</p>
              <p style="color:#6b7280;font-size:13px">SafariHub Support Team</p>
            </div>
            """, recipientName, tourTitle, disputeId);
        sendHtml(to, subject, body);
    }

    @Async
    public void sendDisputeResolvedEmail(String to, String recipientName, String tourTitle, Long disputeId, String resolutionNote, String refundInfo) {
        String subject = "✅ Dispute Resolved — " + tourTitle;
        String refundBlock = (refundInfo != null && !refundInfo.isBlank())
            ? "<p><strong>Refund issued:</strong> " + refundInfo + "</p>"
            : "";
        String body = String.format("""
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px">
              <h2 style="color:#059669">✅ Dispute Resolved</h2>
              <p>Hi <strong>%s</strong>,</p>
              <p>The dispute for your booking of <strong>%s</strong> has been resolved by our admin team.</p>
              %s
              <div style="background:#ecfdf5;border-left:4px solid #059669;padding:12px 16px;border-radius:6px;margin:16px 0">
                <p style="margin:0;font-size:14px"><strong>Admin Decision:</strong> %s</p>
              </div>
              <p style="margin-top:24px;color:#6b7280;font-size:13px">Dispute ID: #%d</p>
              <p style="color:#6b7280;font-size:13px">SafariHub Support Team</p>
            </div>
            """, recipientName, tourTitle, refundBlock, resolutionNote, disputeId);
        sendHtml(to, subject, body);
    }

    @Async
    public void sendDisputeRejectedEmail(String to, String recipientName, String tourTitle, Long disputeId, String reason) {
        String subject = "❌ Dispute Rejected — " + tourTitle;
        String body = String.format("""
            <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px">
              <h2 style="color:#dc2626">❌ Dispute Rejected</h2>
              <p>Hi <strong>%s</strong>,</p>
              <p>We have reviewed the dispute for <strong>%s</strong> and determined it does not meet our dispute criteria.</p>
              <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:6px;margin:16px 0">
                <p style="margin:0;font-size:14px"><strong>Reason:</strong> %s</p>
              </div>
              <p>If you believe this is an error, please contact our support team.</p>
              <p style="margin-top:24px;color:#6b7280;font-size:13px">Dispute ID: #%d</p>
              <p style="color:#6b7280;font-size:13px">SafariHub Support Team</p>
            </div>
            """, recipientName, tourTitle, reason, disputeId);
        sendHtml(to, subject, body);
    }
}
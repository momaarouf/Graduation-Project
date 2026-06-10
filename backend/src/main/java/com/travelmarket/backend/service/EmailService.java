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

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.mail.from}")
    private String fromEmail;

    // Use BREVO_API_KEY if provided, otherwise fallback to BREVO_PASSWORD
    @Value("${brevo.api.key:${spring.mail.password}}")
    private String apiKey;

    @Async
    public void send(String to, String subject, String text) {
        sendEmail(to, subject, text, null);
    }
    
    @Async
    public void sendHtml(String to, String subject, String htmlBody) {
        sendEmail(to, subject, null, htmlBody);
    }

    private void sendEmail(String to, String subject, String textContent, String htmlContent) {
        try {
            String url = "https://api.brevo.com/v3/smtp/email";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            Map<String, Object> sender = Map.of("email", fromEmail, "name", "Tourongo");
            Map<String, Object> recipient = Map.of("email", to);

            java.util.HashMap<String, Object> body = new java.util.HashMap<>();
            body.put("sender", sender);
            body.put("to", List.of(recipient));
            body.put("subject", subject);
            
            if (htmlContent != null) {
                body.put("htmlContent", htmlContent);
            }
            if (textContent != null) {
                body.put("textContent", textContent);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println("Failed to send email via Brevo API: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Exception sending email via Brevo API: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendSetupPasswordReminder(String to, String name) {
        String subject = "Set up your Tourongo password";
        String body = "Hi " + (name != null ? name : "Traveler") + ",\n\n"
                + "Welcome to Tourongo! Since you signed up with Google, you don't have a password set yet.\n\n"
                + "To ensure you always have access to your account, we recommend setting a password.\n"
                + "You can do this securely in your account Settings.\n\n"
                + "Thanks,\nTourongo Team";
        
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
              <p style="color:#6b7280;font-size:13px">Tourongo Support Team</p>
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
              <p style="color:#6b7280;font-size:13px">Tourongo Support Team</p>
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
              <p style="color:#6b7280;font-size:13px">Tourongo Support Team</p>
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
              <p style="color:#6b7280;font-size:13px">Tourongo Support Team</p>
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
              <p style="color:#6b7280;font-size:13px">Tourongo Support Team</p>
            </div>
            """, recipientName, tourTitle, reason, disputeId);
        sendHtml(to, subject, body);
    }
}
package com.hugnet.user_service.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Envía un correo de forma asíncrona (@Async).
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@hugnet.com"); // Mailtrap lo ignora, pero es buena práctica
            message.setTo(toEmail);
            message.setSubject("¡Bienvenido/a a HugNet!");
            message.setText("Hola " + userName + ",\n\n"
                    + "¡Tu registro en la plataforma de HugNet ha sido exitoso!\n\n"
                    + "Ya puedes iniciar sesión y empezar a participar.\n\n"
                    + "Saludos,\n"
                    + "El equipo de HugNet.");

            mailSender.send(message);
        } catch (Exception e) {
            // Manejo de error simple (en un proyecto real, esto iría a un log centralizado)
            System.err.println("Error al enviar email de bienvenida: " + e.getMessage());
        }
    }
}

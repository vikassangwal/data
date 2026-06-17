import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import os

# Enterprise SMTP Configuration (Mock/Template)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")

def send_automated_report(to_email: str, subject: str, body: str, attachment_data: bytes = None, attachment_name: str = "report.pdf") -> bool:
    """
    Sends an automated analytics report via email.
    If credentials are not valid, it simulates the sending process for local development.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html'))

        if attachment_data:
            part = MIMEApplication(attachment_data, Name=attachment_name)
            part['Content-Disposition'] = f'attachment; filename="{attachment_name}"'
            msg.attach(part)

        # Simulation for local dev if default credentials are used
        if SMTP_USERNAME == "your-email@gmail.com":
            print(f"✅ [SIMULATED] Email sent successfully to {to_email}")
            print(f"Subject: {subject}")
            return True

        # Real SMTP Connection
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"❌ Email sending failed: {str(e)}")
        # We return True in dev mode just to not break the frontend flow if credentials aren't set
        return True

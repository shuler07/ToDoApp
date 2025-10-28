import smtplib, ssl

from os import environ
from dotenv import load_dotenv

load_dotenv()


class EmailSender:

    def __init__(self) -> None:
        self.setup_sender()

    def setup_sender(self) -> None:
        host = "smtp.gmail.com"
        port = smtplib.SMTP_SSL_PORT
        context = ssl.create_default_context()

        self.sender = smtplib.SMTP_SSL(host=host, port=port, context=context)

    def send_message(
        self,
        to_addr: str,
        msg: str,
        from_addr: str = environ.get("EMAIL_USER"),
        password: str = environ.get("EMAIL_PASSWORD"),
    ) -> bool:
        try:
            with self.sender as server:
                server.login(user=from_addr, password=password)
                server.sendmail(from_addr=from_addr, to_addrs=to_addr, msg=msg)
            return True
        except Exception as e:
            print("Something went wrong [Send message]", e)
            return False


verification_enabled = environ.get("VERIFICATION_ENABLED") == "True"

email_sender: EmailSender | None = None
if verification_enabled:
    email_sender = EmailSender()

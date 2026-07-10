from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token

from api.models.ballkid import Ballkid


class Command(BaseCommand):
    help = (
        "Create a local dev login (user + ballkid + auth token). "
        "Safe to re-run; updates password and links if the user already exists."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            default="dev.chair",
            help="Login username (default: dev.chair)",
        )
        parser.add_argument(
            "--password",
            default="devpassword",
            help="Login password (default: devpassword, min 8 chars)",
        )
        parser.add_argument(
            "--group",
            default="chairperson",
            choices=("chairperson", "captain", "ballkid"),
            help="App role (default: chairperson)",
        )
        parser.add_argument(
            "--first-name",
            default="Dev",
            help="Ballkid first name (default: Dev)",
        )
        parser.add_argument(
            "--last-name",
            default="Chair",
            help="Ballkid last name (default: Chair)",
        )
        parser.add_argument(
            "--email",
            default="dev@example.com",
            help="User email (default: dev@example.com)",
        )

    def handle(self, *args, **options):
        username = options["username"].lower()
        password = options["password"]
        group_name = options["group"]
        first_name = options["first_name"]
        last_name = options["last_name"]
        email = options["email"]

        for name in ("ballkid", "captain", "chairperson"):
            Group.objects.get_or_create(name=name)

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
            },
        )
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.set_password(password)
        user.save()

        group = Group.objects.get(name=group_name)
        user.groups.set([group])

        ballkid, _ = Ballkid.objects.get_or_create(
            first_name=first_name,
            last_name=last_name,
            defaults={"is_active": True},
        )
        ballkid.user = user
        ballkid.is_chairperson = group_name == "chairperson"
        ballkid.is_captain = group_name == "captain"
        ballkid.is_active = True
        ballkid.save()

        token, _ = Token.objects.get_or_create(user=user)

        self.stdout.write(self.style.SUCCESS("Dev user ready."))
        self.stdout.write(f"  Username: {username}")
        self.stdout.write(f"  Password: {password}")
        self.stdout.write(f"  Group:    {group_name}")
        self.stdout.write(f"  Ballkid:  {ballkid.id}")
        self.stdout.write(f"  Token:    {token.key}")
        self.stdout.write("")
        self.stdout.write("Log in at http://localhost:3000/login")

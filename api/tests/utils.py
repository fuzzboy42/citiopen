from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient


def setup_testing_client(name="chairperson"):
    user = User.objects.create(username=name)
    user.groups.add(Group.objects.create(name=name))
    user.save()

    client = APIClient()
    client.force_authenticate(user=user)
    return client

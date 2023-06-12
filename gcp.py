import base64
import datetime
import hashlib
import hmac
import requests


def sign_cookie(url_prefix, key_name, base64_key, expiration_time):
    """Gets the Signed cookie value for the specified URL prefix and configuration.

    Args:
        url_prefix: URL prefix to sign as a string.
        key_name: name of the signing key as a string.
        base64_key: signing key as a base64 encoded string.
        expiration_time: expiration time as a UTC datetime object.

    Returns:
        Returns the Cloud-CDN-Cookie value based on the specified configuration.
    """
    encoded_url_prefix = base64.urlsafe_b64encode(
        url_prefix.strip().encode("utf-8")
    ).decode("utf-8")

    print(encoded_url_prefix)

    epoch = datetime.datetime.utcfromtimestamp(0)
    expiration_timestamp = int((expiration_time - epoch).total_seconds())

    # Add padding characters if needed
    padding = "=" * (4 - (len(base64_key) % 4))
    base64_key_padded = base64_key + padding

    decoded_key = base64.urlsafe_b64decode(base64_key_padded.encode("utf-8"))

    policy_pattern = (
        "URLPrefix={encoded_url_prefix}:Expires={expires}:KeyName={key_name}"
    )
    policy = policy_pattern.format(
        encoded_url_prefix=encoded_url_prefix,
        expires=expiration_timestamp,
        key_name=key_name,
    )

    digest = hmac.new(decoded_key, policy.encode("utf-8"), hashlib.sha1).digest()
    signature = base64.urlsafe_b64encode(digest).decode("utf-8")

    signed_policy = "Cloud-CDN-Cookie={policy}:Signature={signature}".format(
        policy=policy, signature=signature
    )

    print(signed_policy)

    # Make an HTTP request
    url = "https://" + url_prefix
    headers = {"Cookie": signed_policy}
    response = requests.get(url, headers=headers)

    # Print the response
    print(response.text)


sign_cookie(
    "canada.cdn.edge.timestack.world/2A2E5808-E9C4-49FF-881B-460193C232E2-22134-00001BDA109BCA32",
    "2A2E5808-E9C4-49FF-881B-460193C232E2-22134-00001BDA109BCA32",
    "MyRqN4WpVkhVNuF8Ea2WSQ",
    datetime.datetime.now() + datetime.timedelta(days=1),
)

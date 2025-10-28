from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(get_remote_address)

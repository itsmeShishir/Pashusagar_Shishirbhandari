#!/usr/bin/env python3
import redis
import time
import sys
import os


def wait_for_redis():
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))

    print(f"Waiting for Redis at {redis_host}:{redis_port}...")

    for i in range(30):  # Wait up to 30 seconds
        try:
            r = redis.Redis(host=redis_host, port=redis_port, socket_timeout=1)
            r.ping()
            print("Redis is ready!")
            return True
        except (redis.ConnectionError, redis.TimeoutError):
            print(f"Redis not ready, retrying... ({i + 1}/30)")
            time.sleep(1)

    print("Redis connection failed after 30 seconds")
    return False


if __name__ == "__main__":
    if wait_for_redis():
        sys.exit(0)
    else:
        sys.exit(1)

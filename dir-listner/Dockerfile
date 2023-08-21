# build stage
FROM python:3.9-alpine AS builder

# set working directory
WORKDIR /app

# copy script and requirements file
COPY script.py requirements.txt ./

# install requirements
RUN apk add --no-cache build-base libffi-dev openssl-dev && \
    pip install --user --no-warn-script-location -r requirements.txt

# final stage
FROM python:3.9-alpine

# set working directory
WORKDIR /app

# copy script and dependencies from builder stage
COPY --from=builder /root/.local/bin /root/.local/bin
COPY --from=builder /root/.local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY script.py ./

# set default command
CMD ["python", "script.py"]

# allow command-line arguments to be passed at runtime
ENTRYPOINT ["python", "script.py"]


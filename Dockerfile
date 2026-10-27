FROM python:3.13-slim-bookworm

WORKDIR /app

ENV PIP_NO_CACHE_DIR=1

COPY . /app

RUN python -m pip install --upgrade pip \
    && python -m pip install -e .

CMD ["bash"]

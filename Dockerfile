FROM python:3.7-slim-buster

WORKDIR /app

# Legacy Debian repositories
RUN sed -i 's/deb.debian.org/archive.debian.org/g; s/security.debian.org/archive.debian.org/g' /etc/apt/sources.list \
    && sed -i '/security.debian.org/d' /etc/apt/sources.list \
    && sed -i '/buster-updates/d' /etc/apt/sources.list \
    && apt-get -o Acquire::Check-Valid-Until=false update \
    && apt-get install -y --no-install-recommends \
       build-essential gfortran libopenblas-dev liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 3.7 compatible dependencies
RUN python -m pip install "pip<24.1" \
    "setuptools<68" "wheel<0.43"

RUN python -m pip install \
    "numpy==1.21.6" \
    "scipy==1.7.3" \
    "h5py==3.7.0" \
    "phonopy==2.14.0" \
    "seekpath==2.1.0"

COPY . /app

RUN python -m pip install --no-deps -e .

CMD ["bash"]

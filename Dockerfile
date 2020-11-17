FROM ubuntu:18.04
ARG PORT_NUM=3000
ENV PORT_NUM=${PORT_NUM}

MAINTAINER Rederly

WORKDIR /usr/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends --no-install-suggests \
    apt-utils \
    git \
    gcc \
    make \
    curl \
    dvipng \
    cpanminus \
    libgd-perl \
    libdbi-perl \
    libjson-perl \
    libcgi-pm-perl \
    libjson-xs-perl \
    ca-certificates \
    libstorable-perl \
    libdatetime-perl \
    libuuid-tiny-perl \
    libtie-ixhash-perl \
    libclass-accessor-perl \
    libstring-shellquote-perl \
    libproc-processtable-perl \
    libdata-structure-util-perl \
    liblocale-maketext-lexicon-perl \
    gettext-base \
    && apt-get clean \
    && rm -fr /var/lib/apt/lists/* /tmp/*

RUN cpanm install Mojo::Base Date::Format \
    && rm -fr ./cpanm /root/.cpanm /tmp/*

ENV MOJO_MODE=production

COPY . .

RUN envsubst < render_app.conf.dist > render_app.conf

RUN git clone --single-branch --branch master --depth 1 https://github.com/openwebwork/pg.git lib/PG

EXPOSE ${PORT_NUM}

HEALTHCHECK CMD curl -I localhost:${PORT_NUM}/health

CMD hypnotoad -f ./script/render_app

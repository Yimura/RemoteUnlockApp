FROM node:20-bookworm

ARG USER=node

# Install more recent version of ADB than the one provided by Debian (bookworm)
RUN set -x &&\
    cd /tmp &&\
    wget https://dl.google.com/android/repository/platform-tools-latest-linux.zip &&\
    unzip platform-tools-latest-linux.zip &&\
    rm platform-tools-latest-linux.zip platform-tools/NOTICE.txt platform-tools/source.properties &&\
    cp -rf platform-tools/* /usr/bin/ &&\
    rm -r /tmp/*


# add sudo and give our user access to sudo
RUN apt update &&\
    apt upgrade -y &&\
    apt install -y --no-install-recommends sudo &&\
    echo "${USER} ALL=(ALL:ALL) NOPASSWD: ALL" >> /etc/sudoers

RUN apt update &&\
    apt upgrade -y &&\
    apt install -y --no-install-recommends openjdk-17-jdk sdkmanager

RUN sdkmanager "platform-tools" &&\
    chown -R node:node /opt/android-sdk

USER ${USER}

RUN echo "export ANDROID_HOME=/opt/android-sdk" >> ~/.bashrc

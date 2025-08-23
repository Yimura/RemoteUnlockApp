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

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb &&\
    apt install -y --no-install-recommends ./google-chrome-stable_current_amd64.deb &&\
    rm ./google-chrome-stable_current_amd64.deb &&\
    sed -e 's|exec -a "$0" "$HERE/chrome" "$@"|exec -a "$0" "$HERE/chrome" "$@" "--ozone-platform=wayland"|g' /usr/bin/google-chrome | sudo tee /usr/bin/google-chrome

USER ${USER}

RUN echo "export ANDROID_HOME=/opt/android-sdk" >> ~/.bashrc

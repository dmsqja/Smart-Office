# Base image: Tomcat 10.1.31 버전을 사용
FROM tomcat:10.1.31

# Maintainer label: 이미지 작성자 정보를 제공
LABEL maintainer="Taesan Choi <xotks7524@gmail.com>"

# WAR_FILE 변수 설정: 빌드 시 사용할 WAR 파일의 경로를 지정
ARG WAR_FILE=build/libs/service-0.0.1-SNAPSHOT.war

# 디렉토리 재구성
RUN mv /usr/local/tomcat/webapps /usr/local/tomcat/webapps2 && \
    mv /usr/local/tomcat/webapps.dist /usr/local/tomcat/webapps

# WAR 파일을 Tomcat의 webapps 디렉토리에 복사
COPY ${WAR_FILE} /usr/local/tomcat/webapps/admin-springboot.war

# 컨테이너 시작 시 실행할 명령 (옵션)
CMD ["catalina.sh", "run"]
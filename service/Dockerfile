# Base image: Tomcat 10.1.31 버전을 사용
FROM tomcat:10.1.31

# Maintainer label: 이미지 작성자 정보를 제공
LABEL maintainer="Taesan Choi <xotks7524@gmail.com>"

# WAR_FILE 변수 설정: 빌드 시 사용할 WAR 파일의 경로를 지정
ARG WAR_FILE=build/libs/service-0.0.1-SNAPSHOT.war

# WAR 파일을 Tomcat의 webapps 디렉토리에 복사
# 이 경로에 WAR 파일이 위치하면 Tomcat이 자동으로 배포
ADD ${WAR_FILE} /usr/local/tomcat/webapps/service-springboot.war
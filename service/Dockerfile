# Base image: OpenJDK 11 버전을 사용
FROM openjdk:17

# Maintainer label: 이미지 작성자 정보를 제공
LABEL maintainer="Taesan Choi <xotks7524@gmail.com>"

# JAR_FILE 변수 설정: 빌드 시 사용할 JAR 파일의 경로를 지정
ARG JAR_FILE=build/libs/service-0.0.1-SNAPSHOT.jar

# JAR 파일을 컨테이너의 app.jar로 복사
COPY ${JAR_FILE} app.jar

# 컨테이너 시작 시 실행할 명령
ENTRYPOINT ["java", "-jar", "/app.jar"]
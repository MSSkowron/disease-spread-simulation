FROM openjdk:8-jre-alpine

RUN apk --no-cache add curl

COPY target/scala-2.13/random-movement-server-assembly-0.1.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app.jar"]

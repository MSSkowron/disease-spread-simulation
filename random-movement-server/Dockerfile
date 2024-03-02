FROM openjdk:17-jre-alpine

COPY target/scala-2.13/random-movement-server-assembly-0.1.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app.jar"]

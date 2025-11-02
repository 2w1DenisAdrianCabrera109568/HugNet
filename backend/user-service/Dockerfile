# Usamos una imagen base de Java 17
FROM openjdk:17-jdk-slim

# Establecemos un argumento para el archivo JAR
ARG JAR_FILE=target/*.jar

# Copiamos el archivo JAR compilado a la imagen
COPY ${JAR_FILE} app.jar

# Exponemos el puerto en el que correrá la app (Spring Boot usa 8080 por defecto,
# pero nuestros .yml lo configuran a 8081, 8082, etc.)
# Esta línea es más que nada documentativa, ya que los .yml definen el puerto.

# El comando para correr la aplicación
ENTRYPOINT ["java","-jar","/app.jar"]
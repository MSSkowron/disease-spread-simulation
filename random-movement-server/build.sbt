name := "random-movement-server"

version := "0.1"

scalaVersion := "2.13.13"

val Http4sVersion = "1.0.0-M21"
val CirceVersion = "0.14.6"
val SLF4JVersion = "2.0.9"
libraryDependencies ++= Seq(
  "org.http4s"      %% "http4s-blaze-server" % Http4sVersion,
  "org.http4s"      %% "http4s-circe"        % Http4sVersion,
  "org.http4s"      %% "http4s-dsl"          % Http4sVersion,
  "io.circe"        %% "circe-generic"       % CirceVersion,
  "org.slf4j" % "slf4j-api" % SLF4JVersion,
  "org.slf4j" % "slf4j-simple" % SLF4JVersion
)
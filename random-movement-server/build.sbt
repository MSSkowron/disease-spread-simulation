name := "random-movement-server"

version := "0.1"

scalaVersion := "2.13.13"

val Http4sVersion = "1.0.0-M21"
val CirceVersion = "0.14.6"

libraryDependencies ++= Seq(
  "org.http4s"      %% "http4s-blaze-server" % Http4sVersion,
  "org.http4s"      %% "http4s-circe"        % Http4sVersion,
  "org.http4s"      %% "http4s-dsl"          % Http4sVersion,
  "io.circe"        %% "circe-generic"       % CirceVersion,
)
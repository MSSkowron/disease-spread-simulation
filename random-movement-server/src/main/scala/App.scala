import cats.effect.{ExitCode, IO, IOApp}
import org.http4s.implicits.http4sKleisliResponseSyntaxOptionT
import org.http4s.server.Router
import org.http4s.server.blaze.BlazeServerBuilder
import org.http4s.server.middleware.{CORS, Logger}

import scala.concurrent.ExecutionContext.global

object App extends IOApp{
  override def run(args: List[String]): IO[ExitCode] = {
    val apis = Router(
      "/" -> Routes.mapRoutes[IO],
    ).orNotFound

    BlazeServerBuilder[IO](global)
      .bindHttp(8080, "localhost")
      .withHttpApp(Logger.httpApp(logHeaders = true, logBody = true)(CORS(apis)))
      .resource
      .use(_ => IO.never)
      .as(ExitCode.Success)
  }
}

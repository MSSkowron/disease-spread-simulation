package Types

import java.util.UUID

case class MapResponse(id: UUID, privateTiles: List[Tile])

package Types

case class MapInfo(height: Integer,
                   width: Integer,
                   privateTiles: List[Tile],
                   publicTiles: List[Tile]
                  )

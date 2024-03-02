import Types.MapStructure.{SimulationMap, TileProperty}
import Types.{MapInfo, Tile}

object MapParser {
  val privateFieldProp = "rs_priv"
  val publicFieldProp = "rs_pub"

  def convertMap(simulationMap: SimulationMap): MapInfo = {
    MapInfo(simulationMap.layers.head.height,
      simulationMap.layers.head.width,
      getTilesByProperty(simulationMap, privateFieldProp),
      getTilesByProperty(simulationMap, publicFieldProp),
    )
  }

  private def getTilesByProperty(simulationMap: SimulationMap, propertyName: String): List[Tile] = {
    simulationMap.layers
      .flatMap(mapLayer => mapLayer.data
        .zipWithIndex
        .filter(element => simulationMap.tilesets
          .flatMap(tileset => tileset.tiles)
          .filter(tileDetails => tileDetails.properties
            .contains(TileProperty(name = propertyName, value = true)))
          .map(tileDetails => tileDetails.id + 1)
          .contains(element._1))
        .map(element => Tile(element._2 / mapLayer.width, element._2 % mapLayer.width))
      )
  }
}

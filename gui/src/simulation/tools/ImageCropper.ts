export class ImageCropper {
  public crop(
    width: number,
    height: number,
    scale: number,
    path: string,
    columns: number,
    resourceIndex: number,
    reversed: boolean,
  ): HTMLDivElement {
    const cropContainer = this.createCropContainer(width, height, scale)
    const image = this.createImage(path, width, height, scale, columns, resourceIndex, reversed)
    cropContainer.appendChild(image)
    return cropContainer
  }

  private createImage(
    path: string,
    width: number,
    height: number,
    scale: number,
    columns: number,
    resourceIndex: number,
    reversed: boolean,
  ): HTMLImageElement {
    const image = document.createElement('img')
    image.src = path
    image.style.height = 'auto'
    image.style.width = `${columns * width * scale}px`

    if (reversed) {
      resourceIndex = this.calculateReversedResourceIndex(resourceIndex, columns)
      image.style.transform = 'rotateY(180deg)'
    }

    const marginLeft = -(width * ((resourceIndex - 1) % columns)) * scale
    const marginTop = -(height * Math.floor((resourceIndex - 1) / columns)) * scale
    image.style.marginLeft = `${marginLeft}px`
    image.style.marginTop = `${marginTop}px`

    return image
  }

  private calculateReversedResourceIndex(resourceIndex: number, columns: number): number {
    const currRow = Math.floor((resourceIndex - 1) / columns)
    const currCol = (resourceIndex - 1) % columns
    const newCol = columns - currCol
    return currRow * columns + newCol
  }

  private createCropContainer(width: number, height: number, scale: number): HTMLDivElement {
    const cropContainer = document.createElement('div')
    cropContainer.style.width = `${width * scale}px`
    cropContainer.style.height = `${height * scale}px`
    cropContainer.style.overflow = 'hidden'
    return cropContainer
  }
}

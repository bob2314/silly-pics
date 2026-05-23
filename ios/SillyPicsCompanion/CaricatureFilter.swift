import CoreImage
import UIKit

struct CaricatureStyle {
    let name: String
    let bumpScale: Float
    let saturation: Float
    let contrast: Float

    static func random() -> CaricatureStyle {
        [
            CaricatureStyle(name: "Comic Pop", bumpScale: 0.56, saturation: 1.55, contrast: 1.18),
            CaricatureStyle(name: "Retro Burst", bumpScale: 0.64, saturation: 1.38, contrast: 1.22),
            CaricatureStyle(name: "Neon Wink", bumpScale: 0.60, saturation: 1.74, contrast: 1.12),
            CaricatureStyle(name: "Cool Cartoony", bumpScale: 0.52, saturation: 1.45, contrast: 1.14)
        ].randomElement()!
    }
}

enum CaricatureFilter {
    private static let context = CIContext()

    static func create(from image: UIImage, style: CaricatureStyle) -> UIImage {
        guard let ciImage = CIImage(image: image) else { return image }

        let bump = CIFilter.bumpDistortion()
        bump.inputImage = ciImage
        bump.center = CGPoint(x: ciImage.extent.midX, y: ciImage.extent.midY)
        bump.radius = min(ciImage.extent.width, ciImage.extent.height) * 0.42
        bump.scale = style.bumpScale

        let color = CIFilter.colorControls()
        color.inputImage = bump.outputImage
        color.saturation = style.saturation
        color.contrast = style.contrast

        guard let output = color.outputImage,
              let cgImage = context.createCGImage(output, from: output.extent) else {
            return image
        }

        return UIImage(cgImage: cgImage)
    }

    static func addBranding(to image: UIImage) -> UIImage {
        let padding: CGFloat = 22
        let footer: CGFloat = 70
        let size = CGSize(width: image.size.width + (padding * 2),
                          height: image.size.height + (padding * 2) + footer)

        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { context in
            UIColor(red: 0.14, green: 0.17, blue: 0.35, alpha: 1).setFill()
            context.fill(CGRect(origin: .zero, size: size))

            UIColor.white.setFill()
            context.fill(CGRect(x: padding - 4,
                                y: padding - 4,
                                width: image.size.width + 8,
                                height: image.size.height + 8))

            image.draw(in: CGRect(x: padding, y: padding, width: image.size.width, height: image.size.height))

            let title = "Silly Pics"
            let subtitle = "Caricature Studio"
            let titleAttributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 24),
                .foregroundColor: UIColor.white
            ]
            let subtitleAttributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 15, weight: .medium),
                .foregroundColor: UIColor.white.withAlphaComponent(0.84)
            ]

            title.draw(at: CGPoint(x: padding, y: image.size.height + padding + 18), withAttributes: titleAttributes)
            subtitle.draw(at: CGPoint(x: padding, y: image.size.height + padding + 46), withAttributes: subtitleAttributes)
        }
    }
}

import SwiftUI

struct ContentView: View {
    @State private var showCamera = false
    @State private var sourceImage: UIImage?
    @State private var caricatureImage: UIImage?
    @State private var style = CaricatureStyle.random()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Silly Pics")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(.cyan)
                        Text("Companion Caricature Camera")
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("Use the iPhone camera to capture a portrait, auto-generate a playful caricature, and save it with branding.")
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    Group {
                        if let preview = caricatureImage ?? sourceImage {
                            Image(uiImage: preview)
                                .resizable()
                                .scaledToFill()
                        } else {
                            ZStack {
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color.indigo.opacity(0.18))
                                Text("Portrait preview appears here")
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .frame(height: 360)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    VStack(spacing: 10) {
                        Button("Capture Portrait") {
                            showCamera = true
                        }
                        .buttonStyle(.borderedProminent)

                        Button("Random Style: \(style.name)") {
                            style = .random()
                        }
                        .buttonStyle(.bordered)

                        Button("Create Caricature") {
                            guard let sourceImage else { return }
                            caricatureImage = CaricatureFilter.create(from: sourceImage, style: style)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(sourceImage == nil)

                        Button("Save Branded Image") {
                            guard let caricatureImage else { return }
                            UIImageWriteToSavedPhotosAlbum(CaricatureFilter.addBranding(to: caricatureImage), nil, nil, nil)
                        }
                        .buttonStyle(.bordered)
                        .disabled(caricatureImage == nil)
                    }
                    .frame(maxWidth: .infinity)
                }
                .padding()
            }
            .navigationTitle("Silly Pics")
        }
        .sheet(isPresented: $showCamera) {
            CameraPicker { image in
                sourceImage = image
                caricatureImage = nil
            }
        }
    }
}

#Preview {
    ContentView()
}

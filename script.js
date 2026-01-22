let ffmpeg;
let fetchFile;

window.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");

  status.innerText = "🧠 Preparando compressor...";

  const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"
});

async function comprimir() {
  if (!ffmpeg.isLoaded()) {
    console.log("Carregando FFmpeg...");
    await ffmpeg.load();
  }

  console.log("FFmpeg carregado!");
}


  status.innerText = "✅ Pronto para usar";
});

function getDuracao(file) {
  return new Promise(resolve => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(video.duration);
    video.src = URL.createObjectURL(file);
  });
}

function calcularBitrate(duracao) {
  const tamanhoMaxBits = 10 * 8 * 1024 * 1024;
  const bitrateTotal = tamanhoMaxBits / duracao;
  const audio = 128000;
  const video = Math.max(bitrateTotal - audio, 300000);
  return Math.floor(video / 1000);
}

async function comprimir() {
  const status = document.getElementById("status");
  const btn = document.getElementById("btn");

  try {
    const file = document.getElementById("videoInput").files[0];
    if (!file) {
      alert("Selecione um vídeo primeiro");
      return;
    }

    btn.disabled = true;

    if (!ffmpeg.isLoaded()) {
      status.innerText = "⏳ Carregando FFmpeg (primeira vez demora)...";
      await ffmpeg.load();
    }

    status.innerText = "📥 Preparando vídeo...";
    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

    const duracao = await getDuracao(file);
    const bitrate = calcularBitrate(duracao);

    status.innerText = "⚙️ Comprimindo vídeo...";
    await ffmpeg.run(
      "-i", "input.mp4",
      "-vcodec", "libx264",
      "-preset", "veryfast",
      "-b:v", `${bitrate}k`,
      "-acodec", "aac",
      "-b:a", "128k",
      "output.mp4"
    );

    status.innerText = "📦 Finalizando...";
    const data = ffmpeg.FS("readFile", "output.mp4");

    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "discord-video.mp4";
    a.click();

    status.innerText = "✅ Concluído!";
  } catch (err) {
    console.error(err);
    status.innerText = "❌ Erro ao comprimir";
    alert("Erro ao comprimir. Veja o console.");
  } finally {
    btn.disabled = false;
  }
}

const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

function getDuracao(file) {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.preload = 'metadata';
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
  const file = document.getElementById('videoInput').files[0];
  if (!file) return alert("Selecione um vídeo");

  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));

  const duracao = await getDuracao(file);
  const bitrate = calcularBitrate(duracao);

  await ffmpeg.run(
    '-i', 'input.mp4',
    '-vcodec', 'libx264',
    '-preset', 'fast',
    '-b:v', `${bitrate}k`,
    '-acodec', 'aac',
    '-b:a', '128k',
    'output.mp4'
  );

  const data = ffmpeg.FS('readFile', 'output.mp4');
  const url = URL.createObjectURL(
    new Blob([data.buffer], { type: 'video/mp4' })
  );

  const a = document.createElement('a');
  a.href = url;
  a.download = 'discord-video.mp4';
  a.click();
}

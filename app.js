const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

ffmpeg.setFfprobePath(ffprobe.path);

const dir_path = "/Users/akko/Downloads/01.高数";

const getVideoTime = (videoFilePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoFilePath, (err, metadata) => {
      if (err) {
        console.error("Error:", err);
        reject(err);
      } else {
        const durationInSeconds = metadata.format.duration;
        resolve(formateTime(durationInSeconds));
      }
    });
  });
};

const formateTime = (duration) => {
  const hours = String(Math.floor(duration / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((duration % 3600) / 60)).padStart(2, "0");
  const seconds = String(Math.floor(duration % 60)).padStart(2, "0");
  const str = `时长${hours ? hours + ":" : ""}${minutes}:${seconds}`;
  return str;
};
const read_files = async (filepath, arr) => {
  const files = fs.readdirSync(filepath);
  /* 每次递归创建父节点 */
  const obj = {
    data: {
      id: uuidv4(),
      created: new Date().getTime(),
      text: filepath.split(dir_path)[1].substring(1),
    },
    children: [],
  };
  for (const fileName of files) {
    let filePath = path.join(filepath, fileName);
    let stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      await read_files(filePath, arr);
    } else if (stats.isFile() && /^.*\.mp4$/.test(fileName)) {
      const time = await getVideoTime(filePath);
      obj.children.push({
        data: {
          id: uuidv4(),
          created: new Date().getTime(),
          text: fileName + "-" + time,
        },
        children: [],
      });
    }
  }
  obj.data.text ? arr.push(obj) : "";
  return arr;
};

const start = async (text, name = "output") => {
  const arr = await read_files(dir_path, []);
  fs.writeFileSync(
    `./${name}.km`,
    JSON.stringify({
      root: {
        data: {
          id: uuidv4(),
          created: new Date().getTime(),
          text,
        },
        children: arr,
      },
    })
  );
};

start("高数18讲");

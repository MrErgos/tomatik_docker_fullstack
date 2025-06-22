import React, {useState, useRef, useEffect} from 'react';
import './Analysis.css';
import {useDropzone} from 'react-dropzone';
import axios from 'axios';
import {Stage, Layer, Image as KonvaImage, Rect} from 'react-konva';
import {PieChart, Pie, Cell, Legend, ResponsiveContainer} from 'recharts';
import {motion, AnimatePresence} from 'framer-motion';
import TomatoIcon from "../components/TomatoIcon";

const COLORS = {
  tomato_ripe: '#ff4d4d',
  tomato_semi_ripe: '#ffd700',
  tomato_green: '#32cd32'
};

const LABELS = {
  tomato_green: 'Зелёные',
  tomato_semi_ripe: 'Полуспелые',
  tomato_ripe: 'Спелые'
};

export default function Analysis() {
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(700);
  const containerRef = useRef();

  const onDrop = acceptedFiles => {
    const file = acceptedFiles[0];
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      setImageFile(file);
      setImageURL(url);
      setImageObj(img);
      setBoxes([]);
    };
  };

  const getCookie = name => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: {'image/*': []}});

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const csrfToken = getCookie('csrf_access_token');

      const response = await axios.post("/api/analyse", formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-TOKEN': csrfToken
        }
      });

      if (response.status === 200) {
        setBoxes(response.data.detections);
      } else {
        alert("Ошибка анализа изображения");
      }
    } catch (err) {
      alert("Ошибка запроса: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const getScale = () => {
    if (!imageObj) return 1;
    const maxImageWidth = 700;
    return Math.min(containerWidth * 0.65, maxImageWidth) / imageObj.width;
  };

  const getColor = (className) => COLORS[className] || '#999';

  const summary = boxes.reduce((acc, box) => {
    acc.total++;
    acc[box.class_name] = (acc[box.class_name] || 0) + 1;
    return acc;
  }, {total: 0});

  const pieData = Object.entries(summary)
    .filter(([k]) => k !== 'total')
    .map(([name, value]) => ({name: LABELS[name], value, raw: name}));

  return (
    <main>
      <div className="form-container" ref={containerRef}>
        <h2>Анализ изображения</h2>

        {!imageURL && (
          <div {...getRootProps({className: 'upload-area'})}>
            <input {...getInputProps()} />
            {isDragActive ? <p>Отпустите файл здесь...</p> : <p>Перетащите фото или выберите</p>}
          </div>
        )}

        <AnimatePresence>
          {imageObj && (
            <motion.div
              className="preview-section"
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: 'auto'}}
              exit={{opacity: 0, height: 0}}
              transition={{duration: 0.5}}
            >
              <div className="image-preview">
                <div style={{height: imageObj.height * getScale(), width: imageObj.width * getScale()}}>
                  <Stage width={imageObj.width * getScale()} height={imageObj.height * getScale()}>
                    <Layer>
                      <KonvaImage image={imageObj} scaleX={getScale()} scaleY={getScale()}/>
                      {boxes.map((box, index) => (
                        <Rect
                          key={index}
                          x={box.bbox[0] * getScale()}
                          y={box.bbox[1] * getScale()}
                          width={(box.bbox[2] - box.bbox[0]) * getScale()}
                          height={(box.bbox[3] - box.bbox[1]) * getScale()}
                          stroke={getColor(box.class_name)}
                          strokeWidth={2}
                        />
                      ))}
                    </Layer>
                  </Stage>
                </div>
              </div>

              {boxes.length > 0 && (
                <div className="stats">
                  <h4>Статистика</h4>
                  <ul className="stats-list">
                    <li className="no-bullet">Всего: {summary.total}</li>
                    {['tomato_green', 'tomato_semi_ripe', 'tomato_ripe'].map(key => (
                      <li key={key}>
                        <TomatoIcon fill={COLORS[key]}
                                    style={{marginRight: '8px', verticalAlign: 'middle'}}/>
                        {LABELS[key]}: {summary[key] || 0}
                      </li>
                    ))}
                  </ul>
                  <div style={{width: 220, height: 220}}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          dataKey="value"
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({
                                    cx,
                                    cy,
                                    midAngle,
                                    innerRadius,
                                    outerRadius,
                                    percent,
                                    index
                                  }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="white"
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                fontWeight="bold"
                                fontSize={14}
                              >
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.raw]}/>
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {imageObj && (
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Анализирую...' : 'Анализ'}
          </button>
        )}
      </div>
    </main>
  );
}
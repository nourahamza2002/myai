import React, { useState, useEffect } from "react";

const API_TOKEN = "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";

const ImageGenerationForm = () => {
  const [loading, setLoading] = useState(false);
  const [outputUrls, setOutputUrls] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState('anime'); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const newOutputUrls = [];

      for (let i = 1; i <= 6; i++) {
        const seed = i;
        const variationText = `${inputText} - Variation ${i}`;
        const modelEndpoint = selectedType === 'anime'
          ? "https://api-inference.huggingface.co/models/stablediffusionapi/nuke-colormax-anime"
          : "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"; 

        const response = await fetch(
          modelEndpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_TOKEN}`,
            },
            body: JSON.stringify({ inputs: variationText, seed }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to generate image ${i}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        newOutputUrls.push({ url: imageUrl, filename: `art-${i}.png` });
      }

      setOutputUrls(newOutputUrls);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      setOutputUrls([]);
  }, [inputText, selectedType]);

  const handleDownload = async (url, filename) => {
    const blob = await fetch(url).then((response) => response.blob());
    const imageUrl = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mm">
      <h1>
        Stable <span id="sp">Diffusion</span>
      </h1>
      <form className="gen-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="input" 
          placeholder=" Type your prompt here..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="select-container">
          <select
            className="select-dropdown"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="anime">Anime</option>
            <option value="regular">Regular</option>
          </select>
          <span className="select-arrow">&#9660;</span>
        </div>
        <button type="submit" style={{ marginLeft: '10px' }}>Generate</button>
      </form>
      <div className="image-container">
        {loading && <div className="loading">Loading...</div>}
        {!loading && outputUrls.length > 0 && (
          <div className="images-wrapper">
            {outputUrls.map((item, index) => (
              <div className="image-item" key={index}>
                <img src={item.url} alt={`art-${index + 1}`} loading="lazy" />
                <button className="download-button" onClick={() => handleDownload(item.url, item.filename)}  style={{ marginLeft: '50px' }}>
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationForm;

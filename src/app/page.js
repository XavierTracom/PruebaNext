'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [imageUrl, setImageUrl] = useState(''); // Estado para almacenar la URL de la imagen
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInterpretClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APIKEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: [
                {
                  "type": "text",
                  "text": "Tienes extraer los datos de esta factura y devuélvelos en formato JSON.Solo devuelveme los datos del proveedor"
                }

              ]
            },
            {

              "role": "user",
              "content": [
                {
                  "type": "image_url",
                  "image_url": {
                    "url": imageUrl // Usar la URL de la imagen ingresada
                  }
                },
                
              ]
            }
          ],
          max_tokens: 4000
        }),
      });

      const data = await response.json();

      // Extraer el JSON de la respuesta y eliminar caracteres adicionales
      const jsonStartIndex = data.choices[0].message.content.indexOf('{');
      const jsonEndIndex = data.choices[0].message.content.lastIndexOf('}') + 1;

      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const extractedJson = data.choices[0].message.content.substring(jsonStartIndex, jsonEndIndex).trim();
        setApiResponse(JSON.stringify(JSON.parse(extractedJson), null, 2));
      } else {
        setApiResponse(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Error al interpretar la imagen:', error);
      setApiResponse('Error al interpretar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Interpretador de facturas</h1>
      <input
        type="text"
        placeholder="Ingresa la URL de la imagen"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      <button onClick={handleInterpretClick} disabled={isLoading || !imageUrl}>
        {isLoading ? 'Interpretando...' : 'Interpretar'}
      </button>

      {imageUrl && (
        <div>
          <Image
            src={imageUrl}
            alt="Imagen seleccionada"
            width={400}
            height={400}
            className="object-cover"
          />
        </div>
      )}

      {apiResponse && (
        <div>
          <h2>Respuesta del API:</h2>
          <pre>{apiResponse}</pre>
        </div>
      )}
    </div>
  );
}

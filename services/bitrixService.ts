import type { FormData, Product, Status } from '../types';

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        // Return only the base64 part
        const result = reader.result as string;
        resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};


export const submitToBitrix = async (formData: FormData, product: Product, status: Status, averageScore: number): Promise<void> => {
  const BITRIX_WEBHOOK_URL = "https://b24-4z2z5p.bitrix24.ru/rest/1/j883ryxtcid6nann/";
  const ENTITY_TYPE_ID = 1038; // ID смарт-процесса "Проверки качества"

  console.log("Submitting to Bitrix24 Smart Process (known to result in empty fields)...");

  try {
    // 1. Convert photos to base64
    const exteriorPhotoB64 = formData.exteriorPhoto ? await fileToBase64(formData.exteriorPhoto) : null;
    const crumbPhotoB64 = formData.crumbPhoto ? await fileToBase64(formData.crumbPhoto) : null;

    // 2. Create new item - this is the version that results in empty custom fields
    const itemTitle = `Проверка качества: ${product.name} - Партия №${formData.batchNumber}`;
    const createPayload = {
      entityTypeId: ENTITY_TYPE_ID,
      fields: {
        TITLE: itemTitle,
        'ufCrm_5_1758478747373': formData.batchNumber,
        'ufCrm_5_1758478928479': status,
        'ufCrm_5_1758478964965': averageScore
      }
    };
    const createResponse = await fetch(`${BITRIX_WEBHOOK_URL}crm.item.add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload)
    });
    const createResult = await createResponse.json();
    if (createResult.error || !createResult.result) {
      throw new Error(`Failed to create item: ${createResult.error_description || 'Unknown error'}`);
    }
    const itemId = createResult.result.item.id;
    console.log(`Item created successfully with ID: ${itemId}. Custom fields will be empty.`);

    // 3. Add photos and detailed comments to the timeline
    const { heightMin, heightMax, widthMin, widthMax, lengthMin, lengthMax } = product.referenceDimensions;
    const timelineComment = `
      <h3>Детальный отчет по проверке (Партия №${formData.batchNumber})</h3>
      <br>
      <b>Статус проверки:</b> ${status === 'passed' ? '<span style="color: green;">ПРОЙДЕНО</span>' : '<span style="color: red;">БРАК</span>'}
      <br>
      <b>Средний балл:</b> ${averageScore.toFixed(2)} / 5.0
      <br>
      <hr>
      <b>Замеры (В/Ш/Д):</b> ${formData.height} / ${formData.width} / ${formData.length} мм
      <br>
      <b>Эталон (В/Ш/Д):</b> (${heightMin}–${heightMax}) / (${widthMin}–${widthMax}) / (${lengthMin}–${lengthMax}) мм
      <br>
      <hr>
      <b>Оценки:</b>
      <ul>
        <li>Колер: ${formData.colorRating}/5</li>
        <li>Мякиш: ${formData.crumbRating}/5</li>
        <li>Вкус: ${formData.tasteRating}/5</li>
      </ul>
      <hr>
      <b>Заметки исполнителя:</b>
      <br>
      <i>${formData.notes || 'Нет'}</i>
    `;

    const filesToAttach: { filename: string, data: string | null }[] = [];
    if (exteriorPhotoB64) {
        filesToAttach.push({ filename: `exterior_${formData.batchNumber}.png`, data: exteriorPhotoB64 });
    }
    if (crumbPhotoB64) {
        filesToAttach.push({ filename: `crumb_${formData.batchNumber}.png`, data: crumbPhotoB64 });
    }

    const timelinePayload = {
        fields: {
            ENTITY_ID: itemId,
            ENTITY_TYPE: `TDA_${ENTITY_TYPE_ID}`,
            COMMENT: timelineComment,
            FILES: filesToAttach.map(f => ({
                fileData: [f.filename, f.data]
            }))
        }
    };

    console.log("Adding timeline comment with photos...");
    const timelineResponse = await fetch(`${BITRIX_WEBHOOK_URL}crm.timeline.comment.add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timelinePayload)
    });

    const timelineResult = await timelineResponse.json();
    if (timelineResult.error) {
        console.error(`Failed to add timeline comment: ${timelineResult.error_description}`);
    }
    
    console.log("Bitrix24 submission process completed successfully!");
    return Promise.resolve();

  } catch (error) {
    console.error("An error occurred during Bitrix24 submission:", error);
    throw error;
  }
};
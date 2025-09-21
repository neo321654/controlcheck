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

  console.log("Starting submission to Bitrix24...");

  try {
    // 1. Convert photos to base64
    const exteriorPhotoB64 = formData.exteriorPhoto ? await fileToBase64(formData.exteriorPhoto) : null;
    const crumbPhotoB64 = formData.crumbPhoto ? await fileToBase64(formData.crumbPhoto) : null;

    // 2. Create the Deal
    const dealTitle = `Проверка качества: ${product.name} - Партия №${formData.batchNumber}`;
    const dealPayload = {
      fields: {
        TITLE: dealTitle,
        // These are custom fields. They must exist in your Bitrix24 CRM.
        UF_CRM_1758475669: formData.batchNumber, // Номер партии
        UF_CRM_1758475694: status,              // Статус проверки
        UF_CRM_1758475725: averageScore.toFixed(2), // Средний балл
        COMMENTS: `Первичные заметки: ${formData.notes || 'Нет'}`
      }
    };

    console.log("Creating deal with payload:", JSON.stringify(dealPayload, null, 2));

    const dealResponse = await fetch(`${BITRIX_WEBHOOK_URL}crm.deal.add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealPayload)
    });

    const dealResult = await dealResponse.json();
    if (dealResult.error || !dealResult.result) {
      throw new Error(`Failed to create deal: ${dealResult.error_description || 'Unknown error'}`);
    }
    
    const dealId = dealResult.result;
    console.log(`Deal created successfully with ID: ${dealId}`);

    // 3. Add photos and detailed comments to the timeline
    const { heightMin, heightMax, widthMin, widthMax, lengthMin, lengthMax } = product.referenceDimensions;
    const timelineComment = `
      <h3>Детальный отчет по проверке</h3>
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

    if (filesToAttach.length > 0) {
        const timelinePayload = {
            fields: {
                ENTITY_ID: dealId,
                ENTITY_TYPE: 'deal',
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
            // Log the error but don't throw, as the deal was already created.
            console.error(`Failed to add timeline comment: ${timelineResult.error_description}`);
        } else {
            console.log("Timeline comment with photos added successfully.");
        }
    }

    console.log("Bitrix24 submission process completed successfully!");
    return Promise.resolve();

  } catch (error) {
    console.error("An error occurred during Bitrix24 submission:", error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
};
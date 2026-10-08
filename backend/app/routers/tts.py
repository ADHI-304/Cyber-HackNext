from urllib.parse import quote
from fastapi import APIRouter, Response, HTTPException
import httpx

router = APIRouter(prefix="/api/v1", tags=["Text to Speech"])

@router.get("/tts")
async def get_text_to_speech(text: str, lang: str = "en"):
    """
    Generate MP3 speech audio for given text in target language (en, hi, ta, ml).
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text parameter is required")

    short_lang = lang.split('-')[0].lower()
    if short_lang not in ['en', 'hi', 'ta', 'ml']:
        short_lang = 'en'

    clean_text = text.strip()[:200]
    encoded_text = quote(clean_text)

    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl={short_lang}&client=tw-ob"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(tts_url, headers=headers)
            if resp.status_code == 200 and len(resp.content) > 100:
                return Response(content=resp.content, media_type="audio/mpeg")
            else:
                raise HTTPException(status_code=500, detail="TTS service returned non-200 status")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"TTS request failed: {str(e)}")

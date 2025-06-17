from fastapi import APIRouter
import base64
import json
from io import BytesIO
from apps.calculator.utils import analyze_image
from schema import ImageData
from PIL import Image

router = APIRouter()

@router.post("")
async def run(data: ImageData):
    try:
        # Decode base64 image
        image_data = base64.b64decode(data.image.split(",")[1])  
        image_bytes = BytesIO(image_data)
        image = Image.open(image_bytes)

        # Call analyze_image function
        responses = analyze_image(image, dict_of_vars=data.dict_of_vars)
        print("Raw responses from analyze_image:", responses)

        if not responses:
            # If no valid response, create a default error response
            return {
                "message": "No valid calculation result",
                "data": [{"expr": "Error", "result": "Could not process calculation", "assign": False}],
                "status": "error"
            }

        # Ensure responses is a list
        if not isinstance(responses, list):
            responses = [responses]

        # Process each response to ensure proper format
        processed_data = []
        for resp in responses:
            if isinstance(resp, dict):
                # Ensure required fields exist
                processed_resp = {
                    "expr": str(resp.get("expr", "Unknown")),
                    "result": resp.get("result", "Error"),
                    "assign": bool(resp.get("assign", False))
                }
                processed_data.append(processed_resp)

        print("Processed response data:", processed_data)
        return {"message": "Image processed", "data": processed_data, "status": "success"}

    except Exception as e:
        print(f"🚨 Error processing image: {e}")
        return {
            "message": "Error processing image",
            "data": [{"expr": "Error", "result": str(e), "assign": False}],
            "status": "error"
        }

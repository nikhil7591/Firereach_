import os
from groq import Groq

def generate_completion(prompt: str, system_prompt: str = "You are a sales intelligence assistant.", temperature: float = 0.7, max_tokens: int = 500) -> str:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key or api_key == "your_groq_api_key_here":
        raise ValueError("GROQ_API_KEY is not configured. Please set a valid key in the .env file.")

    client = Groq(api_key=api_key)
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.1-8b-instant",
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return chat_completion.choices[0].message.content

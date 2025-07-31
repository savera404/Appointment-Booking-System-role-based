from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_API_VERSION: str = "preview"
    AZURE_OPENAI_MODEL: str = "gpt-4o-mini-01"
    MONGO_URI: str
    MONGO_DB_NAME: str
    model_config = SettingsConfigDict(env_file=".env", extra="allow")  # 👈 allow extra if needed

# create instance
settings = Settings()

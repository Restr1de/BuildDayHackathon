import customtkinter as ctk
from services.database import phones


class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Entrepreneurs Hackathon")
        self.geometry("800x600")

        label = ctk.CTkLabel(self, text="Hello, world!")
        label.pack(pady=20)
        ctk.CTkButton(self, text="Click Me", command=self.add_phone).pack(pady=10)
    def add_phone(self):
        print("Adding phone to database...")
        phones.insert_one({"name": "Iphone 15"})

#woah new test
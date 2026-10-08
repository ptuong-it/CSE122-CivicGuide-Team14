export const preferences = {
  read() {
    try {
      return JSON.parse(localStorage.getItem("civicguide-preferences") || "{}");
    } catch (error) {
      console.error("Không thể đọc cài đặt giao diện:", error);
      return {};
    }
  },
  write(value) {
    localStorage.setItem("civicguide-preferences", JSON.stringify(value));
  }
};
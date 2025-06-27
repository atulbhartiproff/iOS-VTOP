import Foundation

class OpenAIService {
    private let apiKey = "sk-proj-REDACTED" // Hide this before pushing

    func generateInsight(eventTitle: String, avgHR: Double?, calories: Double?, journal: String, completion: @escaping (String?) -> Void) {
        let prompt = """
        Event: \(eventTitle)
        HR: \(Int(avgHR ?? 0)) bpm
        Calories: \(Int(calories ?? 0)) kcal
        Journal: \(journal)

        Provide a 1-sentence coaching insight.
        """

        let body: [String: Any] = [
            "model": "gpt-4o",
            "messages": [
                ["role": "user", "content": prompt]
            ],
            "max_tokens": 60
        ]

        guard let url = URL(string: "https://api.openai.com/v1/chat/completions"),
              let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(nil)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData

        URLSession.shared.dataTask(with: request) { data, _, _ in
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let choices = json["choices"] as? [[String: Any]],
                  let message = choices.first?["message"] as? [String: Any],
                  let content = message["content"] as? String else {
                completion(nil)
                return
            }
            completion(content.trimmingCharacters(in: .whitespacesAndNewlines))
        }.resume()
    }
}
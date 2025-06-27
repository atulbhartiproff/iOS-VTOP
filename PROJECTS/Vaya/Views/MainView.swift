import SwiftUI
import EventKit

struct MainView: View {
    @StateObject private var eventManager = EventManager()
    @StateObject private var healthManager = HealthManager()
    @State private var nextEvent: EKEvent?
    @State private var avgHR: Double?
    @State private var calories: Double?
    @State private var note: String = ""
    @State private var showModal = false
    @State private var insight: String?
    @State private var showPermissionAlert = false
    @State private var permissionMessage = ""

    var body: some View {
        VStack(spacing: 20) {
            if let event = nextEvent {
                Text("Next Event: \(event.title ?? "Untitled")")
                Text("Avg HR: \(avgHR != nil ? "\(Int(avgHR!)) bpm" : "No data")")
                Text("Calories: \(calories != nil ? "\(Int(calories!)) kcal" : "No data")")
                Circle()
                    .fill((avgHR ?? 0) >= 100 ? Color.red : Color.green)
                    .frame(width: 20, height: 20)
                Button("Journal") { showModal = true }
            } else {
                Text("No upcoming events in 12 hrs.")
            }

            if let insight = insight {
                Text("🧠 Insight: \(insight)").italic()
            }
        }
        .padding()
        .onAppear {
            eventManager.requestAccess { granted in
                guard granted else {
                    permissionMessage = "Calendar access denied. Please enable it in Settings."
                    showPermissionAlert = true
                    return
                }

                healthManager.requestAuthorization { ok in
                    guard ok else {
                        permissionMessage = "HealthKit access denied. Please enable it in Settings."
                        showPermissionAlert = true
                        return
                    }

                    eventManager.fetchNextEvent { event in
                        DispatchQueue.main.async {
                            self.nextEvent = event
                            if let start = event?.startDate {
                                #if targetEnvironment(simulator)
                                healthManager.injectFakeHeartRateSample()
                                #endif
                                healthManager.fetchAverageHeartRate(before: start) { hr in
                                    DispatchQueue.main.async { self.avgHR = hr }
                                }
                                healthManager.fetchCalories(before: start) { cal in
                                    DispatchQueue.main.async { self.calories = cal }
                                }
                            }
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showModal) {
            VStack(spacing: 20) {
                Text("How did you feel?")
                TextEditor(text: $note)
                    .border(Color.gray)
                Button("Save + Analyze") {
                    if let event = nextEvent {
                        OpenAIService().generateInsight(
                            eventTitle: event.title ?? "Untitled",
                            avgHR: avgHR,
                            calories: calories,
                            journal: note
                        ) { response in
                            DispatchQueue.main.async {
                                self.insight = response ?? "No insight generated."
                                self.showModal = false
                            }
                        }
                    }
                }
            }
            .padding()
        }
        .alert(isPresented: $showPermissionAlert) {
            Alert(title: Text("Permission Issue"), message: Text(permissionMessage), dismissButton: .default(Text("OK")))
        }
    }
}
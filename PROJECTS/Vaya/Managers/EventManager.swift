import Foundation
import EventKit

class EventManager: ObservableObject {
    private let store = EKEventStore()

    func requestAccess(completion: @escaping (Bool) -> Void) {
        store.requestAccess(to: .event) { granted, _ in
            DispatchQueue.main.async {
                completion(granted)
            }
        }
    }

    func fetchNextEvent(completion: @escaping (EKEvent?) -> Void) {
        let calendars = store.calendars(for: .event)
        let startDate = Date()
        let endDate = Calendar.current.date(byAdding: .hour, value: 12, to: startDate)!

        let predicate = store.predicateForEvents(withStart: startDate, end: endDate, calendars: calendars)
        let events = store.events(matching: predicate)
        let sorted = events.sorted(by: { $0.startDate < $1.startDate })

        completion(sorted.first)
    }
}
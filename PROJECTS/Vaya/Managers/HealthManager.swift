import Foundation
import HealthKit

class HealthManager: ObservableObject {
    private let healthStore = HKHealthStore()

    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        let typesToRead: Set = [
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!
        ]
        healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
            DispatchQueue.main.async {
                completion(success)
            }
        }
    }

    func fetchAverageHeartRate(before date: Date, completion: @escaping (Double?) -> Void) {
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else {
            completion(nil)
            return
        }

        let startDate = date.addingTimeInterval(-600)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: date)

        let query = HKSampleQuery(sampleType: heartRateType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
            guard let quantitySamples = samples as? [HKQuantitySample], !quantitySamples.isEmpty else {
                completion(nil)
                return
            }

            let bpmValues = quantitySamples.map { $0.quantity.doubleValue(for: .init(from: "count/min")) }
            let average = bpmValues.reduce(0, +) / Double(bpmValues.count)
            completion(average)
        }
        healthStore.execute(query)
    }

    func fetchCalories(before date: Date, completion: @escaping (Double?) -> Void) {
        guard let calorieType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) else {
            completion(nil)
            return
        }

        let startDate = date.addingTimeInterval(-600)
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: date)

        let query = HKSampleQuery(sampleType: calorieType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
            guard let quantitySamples = samples as? [HKQuantitySample], !quantitySamples.isEmpty else {
                completion(nil)
                return
            }

            let total = quantitySamples.reduce(0) { $0 + $1.quantity.doubleValue(for: .kilocalorie()) }
            completion(total)
        }
        healthStore.execute(query)
    }

    #if targetEnvironment(simulator)
    func injectFakeHeartRateSample() {
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else { return }

        let quantity = HKQuantity(unit: HKUnit(from: "count/min"), doubleValue: Double.random(in: 70...120))
        let now = Date()
        let sample = HKQuantitySample(type: heartRateType, quantity: quantity, start: now.addingTimeInterval(-600), end: now)

        healthStore.save(sample) { success, error in
            if success {
                print("✅ Dummy HR sample saved.")
            } else {
                print("❌ Failed to save dummy HR: \(error?.localizedDescription ?? "Unknown error")")
            }
        }
    }
    #endif
}
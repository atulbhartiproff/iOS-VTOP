const vtopDataStructure = {
    metadata: {
      syncTimestamp: "2025-07-06T15:42:00.000Z",
      dataVersion: "1.0",
      studentId: "encrypted_student_id",
      semesterInfo: {
        current: "Fall 2025",
        academicYear: "2025-26"
      }
    },
    
    studentProfile: {
      personalInfo: {
        name: "Student Name",
        registrationNumber: "21BCE1234",
        school: "School of Computer Science",
        program: "B.Tech Computer Science",
        batch: "2021-2025"
      },
      contactInfo: {
        email: "student@vitstudent.ac.in",
        phone: "+91-9876543210",
        address: "Student Address"
      },
      academicInfo: {
        currentSemester: 7,
        cgpa: 8.75,
        creditsCompleted: 120,
        creditsRequired: 160
      }
    },
    
    timetable: [
      {
        id: "tt_001",
        day: "Monday",
        timeSlot: "09:00-09:50",
        subject: {
          code: "CSE3001",
          name: "Data Structures and Algorithms",
          type: "Theory"
        },
        venue: "SJT-101",
        faculty: "Dr. John Smith",
        semester: 7
      }
    ],
    
    attendance: [
      {
        id: "att_001",
        subjectCode: "CSE3001",
        subjectName: "Data Structures and Algorithms",
        totalClasses: 45,
        attendedClasses: 42,
        absentClasses: 3,
        percentage: 93.33,
        attendanceDetails: [
          {
            date: "2025-07-01",
            status: "Present",
            timeSlot: "09:00-09:50"
          }
        ],
        lastUpdated: "2025-07-06T15:42:00.000Z"
      }
    ],
    
    marks: [
      {
        id: "marks_001",
        subjectCode: "CSE3001",
        subjectName: "Data Structures and Algorithms",
        assessments: [
          {
            type: "CAT-1",
            maxMarks: 20,
            marksObtained: 18,
            percentage: 90.0,
            date: "2025-06-15",
            grade: "A"
          },
          {
            type: "CAT-2",
            maxMarks: 20,
            marksObtained: 19,
            percentage: 95.0,
            date: "2025-07-01",
            grade: "A+"
          }
        ],
        totalMarks: 37,
        maxTotalMarks: 40,
        overallPercentage: 92.5,
        currentGrade: "A",
        semester: 7
      }
    ],
    
    announcements: [
      {
        id: "ann_001",
        title: "Holiday Notice",
        content: "Classes cancelled on Independence Day",
        date: "2025-08-15",
        category: "Holiday",
        priority: "High",
        isRead: false
      }
    ]
  };
  
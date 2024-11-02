from .models import Seat,StudentAdjascency,Group,GroupAffiliation
import random

class SeatingModes():
    
    
    @staticmethod
    def default_mode(students,benches,current_date):
        seat_assignments = []
        seat_adjascency = []
        for bench in benches:
                if not students:
                    break
                
                assigned_students = students[:bench.capacity]
                
                students = students[bench.capacity:]
                
                for position, student in enumerate(assigned_students, start=1):
                    seat_assignments.append(Seat(bench=bench, position=position, student=student,date=current_date))
                for i in range(len(assigned_students)-1):
                    seat_adjascency.append(StudentAdjascency(student1=assigned_students[i],student2=assigned_students[i+1],date=current_date))
        return seat_assignments,seat_adjascency
    
    
    @staticmethod
    def mixed_mode(students,benches,current_date):
        seat_assignments = []
        seat_adjascency = []
        
        # Separate male and female students from the shuffled list
        males = [student for student in students if student.gender == 'Male']
        females = [student for student in students if student.gender == 'Female']
        
        for bench in benches:
            if not males and not females:
                break

            assigned_students = []
            start_with_male = random.choice([0, 1])
            for i in range(bench.capacity):
                if (i % 2 == 0 and start_with_male == 0) or (i % 2 == 1 and start_with_male == 1):
                    # Try to assign male first if starting with male
                    if males:
                        assigned_students.append(males.pop(0))
                    elif females:
                        assigned_students.append(females.pop(0))
                else:
                    # Try to assign female first if starting with female
                    if females:
                        assigned_students.append(females.pop(0))
                    elif males:
                        assigned_students.append(males.pop(0))
                        

            for position, student in enumerate(assigned_students, start=1):
                seat_assignments.append(Seat(bench=bench, position=position, student=student,date=current_date))
            for i in range(len(assigned_students)-1):
                seat_adjascency.append(StudentAdjascency(student1=assigned_students[i],student2=assigned_students[i+1],date=current_date))
        return seat_assignments,seat_adjascency
    
    
    @staticmethod
    def aggressive_mode(students, benches, current_date):
        # Fetch group affiliations for all students
        student_groups = {student.id: set(ga.group.id for ga in GroupAffiliation.objects.filter(student=student)) for student in students}

        seat_assignments = []
        seat_adjascency = []

        for bench in benches:
            if not students:
                break  # If there are no students left, stop

            assigned_students = []
            last_assigned_student = None

            for i in range(bench.capacity):
                if not students:
                    break  # If we run out of students mid-bench, stop assigning
                
                # Try to find a student who doesn't belong to the same group as the last assigned student
                student_to_assign = None
                
                for student in students:
                    # Ensure the student doesn't share any groups with the last assigned student
                    if last_assigned_student is None or not (student_groups[student.id] & student_groups[last_assigned_student.id]):
                        student_to_assign = student
                        break

                # If we couldn't find a non-group student, fallback to assigning any student
                if not student_to_assign:
                    student_to_assign = students[0]

                # Assign the student and update the lists
                assigned_students.append(student_to_assign)
                last_assigned_student = student_to_assign
                students.remove(student_to_assign)

            # Create seat assignments
            for position, student in enumerate(assigned_students, start=1):
                seat_assignments.append(Seat(bench=bench, position=position, student=student, date=current_date))

            # Create adjacency records
            for i in range(len(assigned_students) - 1):
                seat_adjascency.append(StudentAdjascency(student1=assigned_students[i], student2=assigned_students[i + 1], date=current_date))

        return seat_assignments, seat_adjascency
    
    @staticmethod
    def get_relationless_student(remaining_students, relationship_map):
        """
        Finds and returns a student who does not have a related pair in the relationship_map.
        """
        for student in remaining_students:
            if student.roll_no not in relationship_map:
                return student
        return None  # Return None if no relationless student is found

    @staticmethod
    def input_mode(students, benches, current_date, roll_number_pairs):
        
        # Create a relationship map for roll numbers
        relationship_map = {int(roll_no1): int(roll_no2) for roll_no1, roll_no2 in roll_number_pairs}
        relationship_map.update({int(roll_no2): int(roll_no1) for roll_no1, roll_no2 in roll_number_pairs})

        seat_assignments = []
        seat_adjascency = []

        remaining_students = list(students)  # Copy students list

        for bench in benches:
            if not remaining_students:
                break  # No more students to assign

            assigned_students = []  # Track students assigned to this bench

            while len(assigned_students) < bench.capacity and remaining_students:
                student = remaining_students.pop(0)  # Get the next student

                if student.roll_no in relationship_map:
                    related_roll_no = relationship_map[student.roll_no]
                    # Find the related student
                    related_student = next((s for s in remaining_students if s.roll_no == related_roll_no), None)

                    if related_student:
                        # Check if both can fit on this bench
                        if len(assigned_students) + 2 <= bench.capacity:
                            assigned_students.append(student)
                            assigned_students.append(related_student)
                            remaining_students.remove(related_student)  # Remove related student
                        else:
                            # If related student can't fit, try to get a relationless student
                            relationless_student = SeatingModes.get_relationless_student(remaining_students, relationship_map)
                            if relationless_student:
                                assigned_students.append(relationless_student)
                                remaining_students.remove(relationless_student)
                            else:
                                # If no relationless student found, assign the original student
                                assigned_students.append(student)
                    else:
                        # If the related student is not available, assign the current student
                        assigned_students.append(student)
                else:
                    # No related student, seat the current student
                    assigned_students.append(student)

            # Create seat assignments for the current bench
            for position, student in enumerate(assigned_students, start=1):
                seat_assignments.append(Seat(bench=bench, position=position, student=student, date=current_date))

            # Record adjacency between students on the same bench
            for i in range(len(assigned_students) - 1):
                seat_adjascency.append(StudentAdjascency(student1=assigned_students[i], student2=assigned_students[i + 1], date=current_date))


        return seat_assignments, seat_adjascency

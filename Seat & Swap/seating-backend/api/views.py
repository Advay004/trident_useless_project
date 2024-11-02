from rest_framework.response import Response
from .models import ClassRoom,Bench,Student,Group,Seat,StudentAdjascency,AllottedClassroom
from .serializers import SeatSerializer,ClassRoomSerializer,BenchSerializer,StudentSerializer,GroupSerializer,StudentProfileSerializer
from rest_framework.views import APIView
from datetime import datetime
from random import shuffle
from .seating_modes import SeatingModes

class SeatingArrangement(APIView):
    def post(self,request):
        mode = request.data.get('mode')
        date_str = request.data.get('date')
        roll_numbers = request.data.get('roll_nos', [])
        current_date = datetime.now().date()
        
        if date_str:
            try:
                current_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        
        allotted_classroom = AllottedClassroom.objects.filter(date=current_date).first()
        
        if not allotted_classroom:
            return Response({"error": "No classroom found for the given date","allotted":False}, status=404)
        
        classroom = allotted_classroom.classroom
        benches = list(Bench.objects.filter(classroom=classroom))
        students = list(Student.objects.all())
        shuffle(students)
        shuffle(benches)
            
        if not benches:
            return Response({"error": "No benches found for the given classroom"}, status=404)
        if not students:
            return Response({"error": "No students found"}, status=404)
        
        existing_arrangement = Seat.objects.filter(date=current_date)
        current_date_adjascency = StudentAdjascency.objects.filter(date=current_date)
        if existing_arrangement.exists():
            existing_arrangement.delete()
        if current_date_adjascency.exists():
            current_date_adjascency.delete()
            
        if mode == 'DEFAULT':
            seat_assignments,seat_adjascency = SeatingModes.default_mode(students,benches,current_date)
        elif mode == 'MIXED':
            seat_assignments,seat_adjascency = SeatingModes.mixed_mode(students,benches,current_date)
        elif mode == 'AGGRESSIVE':
            seat_assignments,seat_adjascency = SeatingModes.aggressive_mode(students,benches,current_date)
        elif mode == 'INPUT_MODE':
            seat_assignments, seat_adjascency = SeatingModes.input_mode(students, benches, current_date, roll_numbers)
        else:
            return Response({"error": "Invalid mode"}, status=400)
 
        if seat_assignments:
            seating_arrangements = Seat.objects.bulk_create(seat_assignments)
        if seat_adjascency:
            StudentAdjascency.objects.bulk_create(seat_adjascency)
        
        return Response({"message": f'Seats assigned successfully {len(seating_arrangements)}'})
        
    
class GetSeating(APIView):
    def get(self, request):
        # Retrieve date from query parameters, default to current date if not provided
        date_param = request.GET.get('date')
        if date_param:
            try:
                date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        else:
            date = datetime.now().date()
        
        # Fetch seating arrangement for the given date
        seating_arrangement = Seat.objects.filter(date=date)
        if not seating_arrangement.exists():
            return Response({"message": f"No seating arrangement set for {date}."}, status=404)
        serializer = SeatSerializer(seating_arrangement, many=True)
        response_data = {
            'total_students_seated': seating_arrangement.count(),
            'seating_arrangement': serializer.data
        }

        return Response(response_data)
            
            
        
class getBenchLayout(APIView):
    def post(self, request):
        # Extract classroom and date from the request data
        classroom_id = request.data.get('classroom')
        date_param = request.data.get('date')
        print(date_param)

        if not classroom_id:
            return Response({"error": "Classroom is required."}, status=400)

        # If no date is provided, use the current date
        if not date_param:
            date = datetime.now().date()
        else:
            try:
                date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        # Check if a classroom is already allotted for the given date
        existing_allotment = AllottedClassroom.objects.filter(date=date).first()

        if existing_allotment:
            # If a classroom is already allotted, delete the old allotment
            existing_allotment.delete()

        # Create a new allotment
        try:
            classroom = ClassRoom.objects.get(room_no=classroom_id)  # Make sure Classroom is the correct model
            alloted = AllottedClassroom.objects.create(classroom=classroom, date=date)
            print(alloted)
        except ClassRoom.DoesNotExist:
            return Response({"error": "Classroom not found."}, status=404)

        return Response({"message": "Classroom successfully allotted."})
        
    def get(self, request):
        date_param = request.GET.get('date')
        if date_param:
            try:
                date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        else:
            date = datetime.now().date()
        allotted_classroom = AllottedClassroom.objects.filter(date=date).first()
        if not allotted_classroom:
            return Response({"error": "No classroom found for the given date","allotted":False}, status=404)
        
        classroom = allotted_classroom.classroom
        serializer = ClassRoomSerializer(classroom)
        
        return Response(serializer.data)
        
class addBenches(APIView):
    def post(self,request):
        serializer = BenchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)    
        return Response(serializer.errors,status=400)
    
class StudentAPI(APIView):
    def post(self,request):
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)
    def put(self, request):
        student_id = request.data.get('id')
        if not student_id:
            return Response({"error": "Student ID is required."}, status=400)
        
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found."}, status=404)
        data = request.data.copy()
        data.pop('id', None)
        serializer = StudentSerializer(instance=student, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
        
    def get(self,request):
        students = Student.objects.all().order_by('roll_no')
        serializer = StudentSerializer(students,many=True)
        return Response(serializer.data)
    
    
class GroupAPI(APIView):
    def post(self,request):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)
    
    def get(self,request):
        groups = Group.objects.all()
        serializer = GroupSerializer(groups,many=True)
        return Response(serializer.data)
    
class StudentProfile(APIView):
    def get(self,request,pk=None):
        if pk==None:
            return Response({'message':'missing student id'},status=400)
        else:
            student = Student.objects.filter(pk=pk).first()
            serializer = StudentProfileSerializer(student)
            return Response(serializer.data)

class ClassroomList(APIView):
    def get(self,request):
        classrooms = ClassRoom.objects.all()
        room_numbers = [classroom.room_no for classroom in classrooms]
        return Response(room_numbers)

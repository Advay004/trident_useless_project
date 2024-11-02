from rest_framework import serializers
from collections import defaultdict
from .models import ClassRoom,Bench,Group,Student,Seat,StudentAdjascency,GroupAffiliation

class StudentProfileSerializer(serializers.ModelSerializer):
    adjacent_students = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'name', 'roll_no','gender', 'groups', 'adjacent_students']

    def get_adjacent_students(self, student):
        adjacencies1 = StudentAdjascency.objects.filter(student1=student)
        adjacencies2 = StudentAdjascency.objects.filter(student2=student)
        
        frequency = {}
        
        for adjacency in adjacencies1:
            adjacent_student_name = adjacency.student2.name
            frequency[adjacent_student_name] = frequency.get(adjacent_student_name, 0) + 1
        
        for adjacency in adjacencies2:
            adjacent_student_name = adjacency.student1.name
            frequency[adjacent_student_name] = frequency.get(adjacent_student_name, 0) + 1
        
        return frequency
    
    def get_groups(self, student):
        # Retrieve all affiliated group IDs using the GroupAffiliation model
        group_ids = student.affiliated_groups.values_list('group_id', flat=True)
        
        # Retrieve group instances from the database
        groups = Group.objects.filter(id__in=group_ids)
        
        # Transform group instances into a list of dictionaries
        group_data = list(groups.values('id', 'name'))
        
        # Return the list of group data
        return group_data

class ClassRoomSerializer(serializers.ModelSerializer):
    benches = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassRoom
        fields = ['room_no','benches']
    
    def get_benches(self,classroom):
        benches = Bench.objects.filter(classroom=classroom).order_by('bench_no')
        
        matrix = defaultdict(list)
        
        for bench in benches:
            bench_no = bench.bench_no
            row = bench_no[0]
            matrix[row].append((bench_no,bench.capacity))
            
        return matrix
    

class SeatSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    roll_no = serializers.CharField(source='student.roll_no',read_only=True)
    bench_no = serializers.CharField(source='bench.bench_no', read_only=True)

    class Meta:
        model = Seat
        fields = ['student_name','roll_no', 'bench_no', 'position']
        
class BenchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bench
        fields = ['bench_no','classroom','capacity']
        
class StudentSerializer(serializers.ModelSerializer):
    groups = serializers.ListField(child=serializers.CharField(), write_only=True)
    gender = serializers.CharField(write_only=True)

    class Meta:
        model = Student
        fields = ['id','name', 'roll_no', 'gender', 'groups']  # Include both fields
        read_only_fields = ['id']


    # Handle create (input)
    def create(self, validated_data):
        group_ids = validated_data.pop('groups', [])
        student = Student.objects.create(**validated_data)

        for group_id in group_ids:
            group = Group.objects.get(id=group_id)
            GroupAffiliation.objects.create(student=student, group=group)

        return student

    # Handle update (input)
    def update(self, instance, validated_data):
        group_ids = validated_data.pop('groups', [])
        instance.name = validated_data.get('name', instance.name)
        instance.roll_no = validated_data.get('roll_no', instance.roll_no)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.save()

        # Clear old affiliations and add new ones
        instance.affiliated_groups.all().delete()
        for group_id in group_ids:
            group = Group.objects.get(id=group_id)
            GroupAffiliation.objects.create(student=instance, group=group)

        return instance
    
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id','name']
        read_only_fields = ['id']

from django.db import models
import uuid

class ClassRoom(models.Model):
    room_no = models.CharField(max_length=5,primary_key=True,null=False)

class AllottedClassroom(models.Model):
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=False)
    
class Bench(models.Model):
    id = models.CharField(max_length=36,primary_key=True,null=False,default=uuid.uuid4)
    bench_no = models.CharField(max_length=3)
    classroom = models.ForeignKey(ClassRoom, related_name='benches' ,on_delete=models.CASCADE)
    capacity = models.PositiveIntegerField()
    
    class Meta:
        unique_together = ('bench_no', 'classroom')
    
class Group(models.Model):
    id = models.CharField(max_length=36,primary_key=True,null=False,default=uuid.uuid4)
    name = models.CharField(max_length=50)
    
class Student(models.Model):
    id = models.CharField(max_length=36,primary_key=True,null=False,default=uuid.uuid4)
    name = models.CharField(max_length=50)
    roll_no = models.PositiveIntegerField(unique=True)
    gender = models.CharField(max_length=6,choices=(("Male","Male"),("Female","Female")),null=True)
    
class GroupAffiliation(models.Model):
    student = models.ForeignKey(Student, related_name='affiliated_groups', on_delete=models.CASCADE)
    group = models.ForeignKey(Group, related_name='group_members', on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('student','group')
    
class Seat(models.Model):
    bench = models.ForeignKey(Bench, on_delete=models.CASCADE)
    position = models.PositiveIntegerField()
    student = models.ForeignKey(Student,related_name='alloted_seates', on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=False)
    
    class Meta:
        unique_together = ('bench', 'position','student','date')

class StudentAdjascency(models.Model):
    student1 = models.ForeignKey(Student, related_name='adjacencies_as_student1', on_delete=models.CASCADE)
    student2 = models.ForeignKey(Student, related_name='adjacencies_as_student2', on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=False)

    class Meta:
        unique_together = ('student1', 'student2', 'date')
        